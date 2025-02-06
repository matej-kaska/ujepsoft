import { Popover, Transition } from "@headlessui/react";
import { Fragment, type PropsWithChildren } from "react";

type TooltipProps = PropsWithChildren<any> & {
	text?: string;
};

const Tooltip = ({ text, children }: TooltipProps) => {
	return (
		<Popover className="tooltip relative">
			{({ open }) => (
				<>
					<Popover.Button className={"button"} aria-label="Tooltip">
						{children}
					</Popover.Button>

					<Transition show={open} as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
						<Popover.Panel className="panel font-14 absolute z-10 p-2 bg-white rounded-md max-w-sm select-none">{text}</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	);
};

export default Tooltip;
