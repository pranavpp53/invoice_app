function Cards({ title, icon, handleNavigate, style }) {
  return (
    <div className="w-1/2 md:w-1/3 lg:w-1/3 p-2"> 
      <div
        className={`${style} rounded-lg shadow-md p-4 flex flex-col items-center text-white cursor-pointer transform hover:opacity-90 transition-all duration-300`}
        onClick={handleNavigate}
      >
        <div className="flex items-center justify-center mb-2">
          <p className="text-4xl">{icon}</p>
        </div>
        <h3 className="text-xl font-semibold text-center">{title}</h3>
      </div>
    </div>
  );
}

export default Cards;
