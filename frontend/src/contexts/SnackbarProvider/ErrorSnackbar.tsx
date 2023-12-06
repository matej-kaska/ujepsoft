type ErrorSnackbarProps = {
  message: string;
  fade: string;
  closeSnackbar: () => void;
}

const ErrorSnackbar = ({ message, fade, closeSnackbar }: ErrorSnackbarProps) => (
  <div className={`z-50 fixed top-0 left-1/2 transform -translate-x-1/2 mt-8 max-w-md ${fade}`} onClick={closeSnackbar}>
    <div className="bg-red-100 border border-red-800 text-red-800 rounded relativ px-4 py-3 shadow-md">
      <div className="flex items-center">
        <p className="mr-2">{message}</p>
      </div>
    </div>
  </div>
)

export default ErrorSnackbar;