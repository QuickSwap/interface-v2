function ListCard({ datas }) {
  return (
    <div className="rounded-[3rem] bg-list-card overflow-hidden font-semibold text-[3rem] leading-[4rem] tracking-[-0.04em] mb-6">
      <div className="p-3 text-white bg-list-card ">Overview</div>
      <ul className="divide-y-[1px] divide-[#EAEAEA]  divide-opacity-[15%] pl-3">
        {datas.map((data, index) => {
          return (
            <li
              key={index}
              className="font-medium text-white text-opacity-80 text-[1.7rem] leading-[2.8rem] tracking-[-0.01em]  py-1.5"
            >
              <div className="flex items-center justify-between pr-3">
                <span>{data.name}</span>
                <span className="text-right">${data.price}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ListCard;
