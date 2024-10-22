import { FaExclamationTriangle } from "react-icons/fa";

const ErrorMessage = ({ message = "An error occurred. Please try again." }) => {
  return (
    <div className="border border-red text-red px-4 py-3 rounded relative mb-4 flex flex-col items-center justify-center">
      <div className="flex items-center mb-2">
        <FaExclamationTriangle className="mr-2" size={20} />
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{message}</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 bg-red text-white font-bold py-1 px-3 rounded-lg"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorMessage;
