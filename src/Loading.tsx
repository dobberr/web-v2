import "./sys/gui/styles/loader.css";

export default function Loader() {
	return (
		<div className="bg-[#0e0e0e] h-full justify-center items-center flex flex-col lg:h-full md:h-full">
			<div aria-label="Magma" className="magma-logo breathe">Magma</div>
			<div className="duration-150 flex flex-col justify-center items-center">
				<div className="text-container relative flex flex-col justify-center items-end">
					<div className="bg-linear-to-b from-[#ffffff] to-[#ffffff77] text-transparent bg-clip-text flex flex-col lg:items-center md:items-center sm:items-center">
						<span className="font-[700] lg:text-[34px] md:text-[28px] sm:text-[22px] text-right duration-150">
							<span className="font-[1000] duration-150">Magma</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
