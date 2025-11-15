
const pagination = ({page, totalPages, hasPrev, hasNext, onPrev, onNext}) => {
  return (
    <div className="flex justify-center items-center mt-8 gap-4">
        {/* Prev */}
      <button
        disabled={!hasPrev} onClick={onPrev} className={`px-4 py-2 rounded-lg ${
          !hasPrev
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700" }`}>
        Prev
      </button>

      {/* current page */}
      <span className="text-gray-700 font-medium"> Page {page} / {totalPages} </span>
        
      <button
        disabled={!hasNext}
        onClick={onNext}
        className={`px-4 py-2 rounded-lg ${!hasNext ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`} >
        Next
      </button>  
    </div>
)
}

export default pagination