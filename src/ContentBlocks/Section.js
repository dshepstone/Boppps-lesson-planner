import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    ChevronDown,
    Plus,
    FileText,
    Heading,
    List,
    AlertCircle,
    Video,
    Image,
    Music,
    CreditCard
} from 'lucide-react';

// Dropdown that allows adding blocks below the current section without being clipped by parent overflow
const AddBelowDropdown = ({ onAddContent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const options = [
        { type: 'text', icon: FileText, label: 'Text Block', color: 'text-gray-600' },
        { type: 'headline', icon: Heading, label: 'Headline', color: 'text-indigo-600' },
        { type: 'heading', icon: FileText, label: 'Heading', color: 'text-blue-600' },
        { type: 'list', icon: List, label: 'List', color: 'text-green-600' },
        { type: 'info-box', icon: AlertCircle, label: 'Info Box', color: 'text-blue-500' },
        { type: 'exercise-box', icon: AlertCircle, label: 'Exercise Box', color: 'text-emerald-500' },
        { type: 'warning-box', icon: AlertCircle, label: 'Warning Box', color: 'text-amber-500' },
        { type: 'video', icon: Video, label: 'Video', color: 'text-red-500' },
        { type: 'image', icon: Image, label: 'Image/Gallery', color: 'text-purple-500' },
        { type: 'audio', icon: Music, label: 'Audio', color: 'text-indigo-500' },
        { type: 'cards', icon: CreditCard, label: 'Cards', color: 'text-yellow-600' }
    ];

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (type) => {
        onAddContent && onAddContent(type);
        setIsOpen(false);
    };

    // Determine if there's enough space below; if not, position the menu above
    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (!buttonRef.current || !menuRef.current) return;
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight;

            // Determine available space within the closest accordion container
            const container = buttonRef.current.closest('.accordion-content-wrapper');
            const containerRect = container
                ? container.getBoundingClientRect()
                : { top: 0, bottom: window.innerHeight };

            const spaceBelow = containerRect.bottom - buttonRect.bottom;
            const top = spaceBelow < menuHeight ? buttonRect.top - menuHeight : buttonRect.bottom;

            setPosition({
                top: top + window.scrollY,
                left: buttonRect.left + window.scrollX
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const menu = isOpen
        ? ReactDOM.createPortal(
              <ul
                  ref={menuRef}
                  className="absolute z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2"
                  style={{ top: position.top, left: position.left }}
              >
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Text Content
                  </li>
                  {options.slice(0, 6).map((option) => (
                      <li key={option.type}>
                          <button
                              onClick={() => handleSelect(option.type)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                              <option.icon size={16} className={option.color} />
                              <span>{option.label}</span>
                          </button>
                      </li>
                  ))}
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100 border-b border-gray-100 mt-1">
                      Media Content
                  </li>
                  {options.slice(6).map((option) => (
                      <li key={option.type}>
                          <button
                              onClick={() => handleSelect(option.type)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                              <option.icon size={16} className={option.color} />
                              <span>{option.label}</span>
                          </button>
                      </li>
                  ))}
              </ul>,
              document.body
          )
        : null;

    return (
        <div className="relative" ref={buttonRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
                <Plus size={16} />
                <span className="text-sm font-medium">Add Below</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {menu}
        </div>
    );
};

export default AddBelowDropdown;
