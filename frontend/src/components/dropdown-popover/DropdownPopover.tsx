import { Fragment, ReactNode } from 'react';
import { Popover, Transition } from '@headlessui/react';
import "./DropdownPopover.scss";

type DropdownPopoverProps = {
  buttonChildren: ReactNode;
  panelChildren: ReactNode;
  buttonClassName?: string;
  panelClassName?: string;
  text?: string;
  className?: string;
  buttonDisabled?: boolean;
}

/* Dropdown that doesn't close after you click some item in it. */
const DropdownPopover = ({className="", buttonChildren, panelChildren, buttonClassName="", panelClassName="", buttonDisabled=false}: DropdownPopoverProps) => {

  return (
    <Popover className={`dropdown-popover ${className}`}>
    {({ open }) => (
      <>
        <Popover.Button className={`button ${buttonClassName} ${buttonDisabled ? "disabled" : ""}`} disabled={buttonDisabled}>
          { buttonChildren }
        </Popover.Button>

        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >

          <Popover.Panel className={`panel font-14 absolute z-10 p-2 bg-white rounded-md max-w-sm select-none ${panelClassName}`}>
            { panelChildren }
          </Popover.Panel>
        </Transition>
      </>
    )}
    </Popover>
  );
}

export default DropdownPopover;