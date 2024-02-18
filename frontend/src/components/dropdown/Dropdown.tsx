import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, Transition } from "@headlessui/react";
import { ButtonHTMLAttributes, Fragment, PropsWithChildren, ReactNode } from "react";

type DropdownProps = PropsWithChildren<any> & {
	label?: string | ReactNode;
	disabled?: boolean;
	upPlacement?: boolean;
	className?: string;
	noArrow?: boolean;
	defaultClasses?: boolean;
	menuMiddle?: boolean;
	menuClasses?: string;
	svg?: ReactNode;
	preLabel?: string;
	id?: string;
};

const Dropdown = ({ label, disabled, upPlacement, className, noArrow, defaultClasses = true, menuMiddle, menuClasses, children, svg, preLabel, id, ...props }: DropdownProps) => {
	return (
		<div className="dropdown relative inline-block">
			<Menu as="div" {...props}>
				<Menu.Button
					disabled={disabled}
					id={id}
					className={`${
						defaultClasses
							? "select-none text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 whitespace-nowrap focus:ring-blue-300 disabled:hover:bg-white dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700 group flex h-min items-center justify-center text-center font-medium focus:z-10 rounded-lg text-sm p-2"
							: ""
					} ${disabled ? "!cursor-not-allowed opacity-50" : ""} ${className ? className : ""}`}
				>
					{preLabel}
					{svg}
					{label}

					{noArrow ? "" : <FontAwesomeIcon icon={upPlacement ? faChevronUp : faChevronDown} className="ml-2 h-3" />}
				</Menu.Button>

				<Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
					<Menu.Items className={`${upPlacement ? "bottom-[50px] origin-bottom" : ""} ${menuClasses} absolute flex flex-col mt-2 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 select-none ${menuMiddle ? "left-[50%] translate-x-[-50%]" : ""}`}>{children}</Menu.Items>
				</Transition>
			</Menu>
		</div>
	);
};

const DropdownItem = ({ children, className, defaultClasses = true, disabled = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & DropdownProps) => {
	return (
		<Menu.Item {...props}>
			{({ active }) => (
				<button className={`${disabled ? "!cursor-not-allowed opacity-50" : ""} ${active ? "!rounded-md bg-gray-100 text-gray-900" : "text-gray-700"} ${defaultClasses ? "flex items-center w-full text-left p-5 select-none" : ""} ${className ? className : ""}`} type="button">
					{children}
				</button>
			)}
		</Menu.Item>
	);
};

Dropdown.Item = DropdownItem;

export default Dropdown;
