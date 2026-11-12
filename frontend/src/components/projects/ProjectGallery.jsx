import { useRef, useState } from 'react'
import { apiRequest } from '../../api/client.js'
import { formatFileSize } from '../../utils/format.js'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Modal from '../ui/Modal.jsx'
import { useToast } from '../toast/toastContext.js'

// Ogranicenja moraju da prate backend i PHP (php.ini):
// - Laravel: najvise 10 slika po zahtevu (UploadProjectImagesRequest)
// - upload_max_filesize = 2M: najvise 2 MB po slici
// - post_max_size = 8M: najvise 8 MB CEO zahtev; uzimamo 7,5 MB, jer zahtev pored slika nosi i delove forme.
const MAX_FILES = 10
const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_TOTAL_BYTES = 7.5 * 1024 * 1024

// Provera PRE slanja: korisnik odmah dobija poruku na srpskom, a ne gresku servera.
function clientErrorMessages(files) {
  const messages = []

  if (files.length > MAX_FILES) {
    messages.push(`Izabrano je ${files.length} slika; odjednom se može poslati najviše ${MAX_FILES}.`)
  }

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      messages.push(`${file.name} je ${formatFileSize(file.size)} (najviše ${formatFileSize(MAX_FILE_BYTES)} po slici).`)
    }
  }

  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > MAX_TOTAL_BYTES) {
    messages.push(
      `Ukupno ${formatFileSize(total)}; odjednom se može poslati najviše ${formatFileSize(MAX_TOTAL_BYTES)}. Pošalji slike u više navrata.`,
    )
  }

  return messages
}

// Laravel vraca greske po fajlu: { "images.0": ["..."], "images.2": ["..."] }.
// Pretvaramo ih u poruke sa imenom fajla, da korisnik zna KOJA slika ne valja.
function uploadErrorMessages(errors, files) {
  return Object.entries(errors).map(([key, messages]) => {
    const match = key.match(/^images\.(\d+)$/)
    const file_name = match ? files[Number(match[1])]?.name : null
    return file_name ? `${file_name}: ${messages[0]}` : messages[0]
  })
}

// Slike poredjane po nizu id-jeva (order). Slike kojih nema u nizu (npr. upravo otpremljene) idu na kraj,
// a id-jevi obrisanih slika se preskacu.
function applyOrder(images, order) {
  if (!order) return images
  const by_id = new Map(images.map((image) => [image.id, image]))
  const ordered = order.map((id) => by_id.get(id)).filter(Boolean)
  return [...ordered, ...images.filter((image) => !order.includes(image.id))]
}

// Da li su dve liste slika istim redom.
function sameOrder(first, second) {
  return first.length === second.length && first.every((image, index) => image.id === second[index].id)
}

// Galerija slika projekta: upload vise slika odjednom, pregled, uvecanje i brisanje.
// onChanged: poziva se posle svake izmene, da roditelj ponovo ucita projekat.
function ProjectGallery({ project, onChanged }) {
  const toast = useToast()
  const file_input = useRef(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [upload_errors, setUploadErrors] = useState([])

  const [preview_image, setPreviewImage] = useState(null)
  const [image_to_delete, setImageToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // --- Sortiranje ---
  // order_override: novi redosled (niz id-jeva) koji prikazujemo ODMAH, dok server ne potvrdi i projekat se ponovo ucita.
  const [order_override, setOrderOverride] = useState(null)
  const [saving_order, setSavingOrder] = useState(false)
  const [dragged_id, setDraggedId] = useState(null)
  const [drop_target_id, setDropTargetId] = useState(null)

  // Kada stigne ponovo ucitan projekat, privremeni redosled brisemo TEK kada server vrati isti redosled.
  // Inace bi zakasneli odgovor od ranijeg pomeranja (kad se slike pomeraju brzo jedna za drugom)
  // na trenutak vratio stari redosled. React obrazac "podesi state tokom crtanja kada se promeni prop".
  const [previous_images, setPreviousImages] = useState(project.images)
  if (project.images !== previous_images) {
    setPreviousImages(project.images)
    if (order_override && sameOrder(project.images, applyOrder(project.images, order_override))) setOrderOverride(null)
  }

  const images = applyOrder(project.images, order_override)

  // Pomera sliku sa mesta from_index na mesto to_index i cuva novi redosled na serveru.
  async function moveImage(from_index, to_index) {
    if (from_index === to_index || to_index < 0 || to_index >= images.length || saving_order) return

    const ids = images.map((image) => image.id)
    const [moved] = ids.splice(from_index, 1)
    ids.splice(to_index, 0, moved)

    setOrderOverride(ids)
    setSavingOrder(true)

    try {
      await apiRequest(`/projects/${project.id}/images/order`, { method: 'PUT', body: { image_ids: ids } })
      onChanged()
    } catch (err) {
      // Vracamo stari redosled.
      setOrderOverride(null)
      toast.error(`Redosled slika nije sačuvan: ${err.message}`)
    } finally {
      setSavingOrder(false)
    }
  }

  // Drag & drop (HTML5): slika koju vucemo se pusta na mesto druge slike.
  function handleDrop(event, target_id) {
    event.preventDefault()
    // Id slike koja se vuce: iz samog dogadjaja (upisan u onDragStart), a dragged_id je rezerva.
    const source_id = Number(event.dataTransfer.getData('text/plain')) || dragged_id
    const from_index = images.findIndex((image) => image.id === source_id)
    const to_index = images.findIndex((image) => image.id === target_id)
    setDraggedId(null)
    setDropTargetId(null)
    if (from_index !== -1 && to_index !== -1) moveImage(from_index, to_index)
  }

  function handleFilesChange(event) {
    // event.target.files je FileList; pretvaramo ga u obican niz.
    const selected = [...event.target.files]
    setFiles(selected)
    // Proveravamo odmah po izboru, da korisnik ne mora prvo da klikne "Otpremi".
    setUploadErrors(clientErrorMessages(selected))
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (files.length === 0) {
      setUploadErrors(['Izaberi bar jednu sliku.'])
      return
    }

    const client_errors = clientErrorMessages(files)
    if (client_errors.length > 0) {
      setUploadErrors(client_errors)
      return
    }

    // Fajlovi se ne mogu poslati kao JSON, pa pravimo FormData (multipart/form-data).
    // Ime "images[]" Laravel cita kao niz: $request->file('images').
    const form_data = new FormData()
    files.forEach((file) => form_data.append('images[]', file))

    setUploading(true)
    setUploadErrors([])

    try {
      const response = await apiRequest(`/projects/${project.id}/images`, { method: 'POST', body: form_data })
      toast.success(response.data.length === 1 ? 'Slika je otpremljena.' : `Otpremljeno slika: ${response.data.length}.`)
      setFiles([])
      // Praznimo <input type="file">; njegovu vrednost React ne kontrolise, pa to radimo preko ref-a.
      file_input.current.value = ''
      onChanged()
    } catch (err) {
      const errors = err.data?.errors

      if (err.status === 413) {
        // 413 = PHP je odbio ceo zahtev kao prevelik (post_max_size), pre nego sto je stigao do Laravela.
        setUploadErrors([`Slike su zajedno prevelike; odjednom se može poslati najviše ${formatFileSize(MAX_TOTAL_BYTES)}.`])
      } else {
        // Greske po fajlu (validacija) ostaju ispod polja; neocekivana greska ide u crvenu notifikaciju.
        if (errors) setUploadErrors(uploadErrorMessages(errors, files))
        else toast.error(`Otpremanje nije uspelo: ${err.message}`)
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      await apiRequest(`/projects/${project.id}/images/${image_to_delete.id}`, { method: 'DELETE' })
      toast.success(`Slika "${image_to_delete.original_name}" je obrisana.`)
      setImageToDelete(null)
      onChanged()
    } catch (err) {
      toast.error(`Brisanje slike nije uspelo: ${err.message}`)
      setImageToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Slike ({project.images.length})</h2>

      <form noValidate onSubmit={handleUpload} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={file_input}
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFilesChange}
            className="block text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Otpremanje...' : 'Otpremi slike'}
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          {files.length > 0
            ? `Izabrano: ${files.length} ${files.length === 1 ? 'fajl' : 'fajlova'} (${formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}). `
            : ''}
          Dozvoljeno: jpg, png, webp; najviše {formatFileSize(MAX_FILE_BYTES)} po slici, {formatFileSize(MAX_TOTAL_BYTES)} ukupno i{' '}
          {MAX_FILES} slika odjednom.
        </p>

        {upload_errors.length > 0 && (
          <Alert>
            <ul className="list-disc space-y-1 pl-5">
              {upload_errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
      </form>

      {images.length === 0 ? (
        <p className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Projekat još nema slika.</p>
      ) : (
        <>
          {images.length > 1 && (
            <p className="text-xs text-gray-500">
              Redosled: prevuci sliku na novo mesto ili koristi ← →. Isti redosled važi i na javnoj stranici projekta.
              {saving_order && <span className="ml-2 font-medium text-blue-700">Čuvanje redosleda...</span>}
            </p>
          )}

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-gallery>
            {images.map((image, index) => (
              <li
                key={image.id}
                data-image-id={image.id}
                draggable={images.length > 1 && !saving_order}
                onDragStart={(event) => {
                  setDraggedId(image.id)
                  event.dataTransfer.effectAllowed = 'move'
                  // Neki browseri (Firefox) ne pocinju prevlacenje bez ovoga.
                  event.dataTransfer.setData('text/plain', String(image.id))
                }}
                onDragOver={(event) => {
                  // preventDefault = "ovde sme da se pusti"
                  event.preventDefault()
                  if (drop_target_id !== image.id) setDropTargetId(image.id)
                }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(event) => handleDrop(event, image.id)}
                onDragEnd={() => {
                  setDraggedId(null)
                  setDropTargetId(null)
                }}
                className={[
                  'relative overflow-hidden rounded-lg bg-white shadow-sm transition',
                  images.length > 1 ? 'cursor-move' : '',
                  dragged_id === image.id ? 'opacity-40' : '',
                  drop_target_id === image.id && dragged_id !== image.id ? 'ring-2 ring-blue-500' : '',
                ].join(' ')}
              >
                {/* Mesto u galeriji (1, 2, 3...). */}
                <span className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white" data-position>
                  {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => setPreviewImage(image)}
                  className="block w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  title="Klikni za uvećanje"
                >
                  {/* draggable={false}: vuce se cela kartica, a ne sama slika. */}
                  <img
                    src={image.url}
                    alt={image.original_name}
                    loading="lazy"
                    draggable={false}
                    className="aspect-square w-full bg-gray-100 object-cover"
                  />
                </button>
                <div className="flex items-center justify-between gap-2 p-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-800" title={image.original_name}>
                      {image.original_name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {images.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Pomeri "${image.original_name}" levo`}
                          disabled={index === 0 || saving_order}
                          onClick={() => moveImage(index, index - 1)}
                        >
                          ←
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Pomeri "${image.original_name}" desno`}
                          disabled={index === images.length - 1 || saving_order}
                          onClick={() => moveImage(index, index + 1)}
                        >
                          →
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="danger" onClick={() => setImageToDelete(image)}>
                      Obriši
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={preview_image !== null} title={preview_image?.original_name} onClose={() => setPreviewImage(null)} wide>
        {preview_image && (
          <img src={preview_image.url} alt={preview_image.original_name} className="mx-auto max-h-[70vh] w-auto rounded" />
        )}
      </Modal>

      <ConfirmDialog
        open={image_to_delete !== null}
        title="Brisanje slike"
        loading={deleting}
        onCancel={() => setImageToDelete(null)}
        onConfirm={handleDelete}
        message={
          image_to_delete && (
            <div className="space-y-3">
              <img src={image_to_delete.url} alt="" className="mx-auto h-32 rounded object-cover" />
              <p>
                Obrisati sliku <strong>{image_to_delete.original_name}</strong>? Biće obrisana i sa diska.
              </p>
            </div>
          )
        }
      />
    </section>
  )
}

export default ProjectGallery
