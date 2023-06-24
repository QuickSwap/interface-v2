import DropDownArr from "../assets/icons/DropdownArr";
function ListCardWithChart({ datas, icon, title }) {
  return (
    <div className="rounded-[3rem] bg-list-card overflow-hidden font-medium mb-6">
      <div className="p-3 text-white bg-list-card flex items-center gap-1.5">
        <img className="h-6 w-6" src={icon} alt={title} />
        <div className="flex flex-col justify-center ">
          <div className="flex gap-1 items-center   ">
            <span className="text-[2.4rem] leading-[3.4rem] tracking-[-0.02em]">
              {title}
            </span>
            <button className="p-0.5">
              <DropDownArr />
            </button>
          </div>

          <span className="text-[1.5rem] text-white text-opacity-80 leading-[2.3rem] tracking-[-0.02em]">
            {title}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ul className="divide-y-[1px] divide-[#EAEAEA]  divide-opacity-[15%] pl-3 basis-[29.7rem]">
          {datas.map((data, index) => {
            return (
              <li
                key={index}
                className="font-medium text-white text-opacity-80 text-[1.7rem] leading-[2.8rem] tracking-[-0.01em]  py-1.5"
              >
                <div className="flex items-center justify-between pr-3">
                  <span>{data.name}</span>
                  <span className="text-right text-white">${data.price}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="basis-[16rem] pr-3 text-center">CHART</div>
      </div>
    </div>
  );
}

export default ListCardWithChart;
