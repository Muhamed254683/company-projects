import { useRef, useState } from 'react'
import { apiRequest } from '../../api/client.js'
import { formatFileSize } from '../../utils/format.js'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Modal from '../ui/Modal.jsx'

const MAX_FILES = 10

// Laravel vraca greske po fajlu: { "images.0": ["..."], "images.2": ["..."] }.
// Pretvaramo ih u poruke sa imenom fajla, da korisnik zna KOJA slika ne valja.
function uploadErrorMessages(errors, files) {
  return Object.entries(errors).map(([key, messages]) => {
    const match = key.match(/^images\.(\d+)$/)
    const file_name = match ? files[Number(match[1])]?.name : null
    return file_name ? `${file_name}: ${messages[0]}` : messages[0]
  })
}

// Galerija slika projekta: upload vise slika odjednom, pregled, uvecanje i brisanje.
// onChanged: poziva se posle svake izmene, da roditelj ponovo ucita projekat.
function ProjectGallery({ project, onChanged }) {
  const file_input = useRef(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [upload_errors, setUploadErrors] = useState([])
  const [message, setMessage] = useState(null)

  const [preview_image, setPreviewImage] = useState(null)
  const [image_to_delete, setImageToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [delete_error, setDeleteError] = useState(null)

  function handleFilesChange(event) {
    // event.target.files je FileList; pretvaramo ga u obican niz.
    setFiles([...event.target.files])
    setUploadErrors([])
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (files.length === 0) {
      setUploadErrors(['Izaberi bar jednu sliku.'])
      return
    }

    // Fajlovi se ne mogu poslati kao JSON, pa pravimo FormData (multipart/form-data).
    // Ime "images[]" Laravel cita kao niz: $request->file('images').
    const form_data = new FormData()
    files.forEach((file) => form_data.append('images[]', file))

    setUploading(true)
    setUploadErrors([])
    setMessage(null)

    try {
      const response = await apiRequest(`/projects/${project.id}/images`, { method: 'POST', body: form_data })
      setMessage(response.data.length === 1 ? 'Slika je otpremljena.' : `Otpremljeno slika: ${response.data.length}.`)
      setFiles([])
      // Praznimo <input type="file">; njegovu vrednost React ne kontrolise, pa to radimo preko ref-a.
      file_input.current.value = ''
      onChanged()
    } catch (err) {
      const errors = err.data?.errors
      setUploadErrors(errors ? uploadErrorMessages(errors, files) : [err.message])
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    try {
      await apiRequest(`/projects/${project.id}/images/${image_to_delete.id}`, { method: 'DELETE' })
      setMessage(`Slika "${image_to_delete.original_name}" je obrisana.`)
      setImageToDelete(null)
      onChanged()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Slike ({project.images.length})</h2>

      {message && <Alert type="success">{message}</Alert>}

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
          {files.length > 0 ? `Izabrano: ${files.length} ${files.length === 1 ? 'fajl' : 'fajlova'}. ` : ''}
          Dozvoljeno: jpg, png, webp; najviše 2 MB po slici i {MAX_FILES} slika odjednom.
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

      {project.images.length === 0 ? (
        <p className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Projekat još nema slika.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {project.images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setPreviewImage(image)}
                className="block w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Klikni za uvećanje"
              >
                <img src={image.url} alt={image.original_name} loading="lazy" className="aspect-square w-full bg-gray-100 object-cover" />
              </button>
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-800" title={image.original_name}>
                    {image.original_name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setDeleteError(null)
                    setImageToDelete(image)
                  }}
                >
                  Obriši
                </Button>
              </div>
            </li>
          ))}
        </ul>
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
        error={delete_error}
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
