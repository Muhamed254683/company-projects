import Alert from './Alert.jsx'
import Button from './Button.jsx'
import Modal from './Modal.jsx'

// Potvrda pre brisanja. Dok traje brisanje (loading), dugmad su iskljucena i modal se ne zatvara.
function ConfirmDialog({
  open,
  title = 'Potvrda brisanja',
  message,
  confirmLabel = 'Obriši',
  onConfirm,
  onCancel,
  loading = false,
  error,
}) {
  function handleClose() {
    if (!loading) onCancel()
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Otkaži
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Brisanje...' : confirmLabel}
          </Button>
        </>
      }
    >
      <div>{message}</div>
      {error && <Alert>{error}</Alert>}
    </Modal>
  )
}

export default ConfirmDialog
