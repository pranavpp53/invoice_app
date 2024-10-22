function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-sm">
      <table className="table-auto w-full bg-blue-500 border-collapse">
        <thead >
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-4 py-2 text-left">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 border border-gray-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
