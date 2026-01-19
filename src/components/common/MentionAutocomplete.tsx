'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onMentionAdded?: (userId: string, userName: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function MentionAutocomplete({
  value,
  onChange,
  onSubmit,
  onMentionAdded,
  disabled = false,
  placeholder = 'Add a comment...',
  autoFocus = false,
}: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect @ mentions
  useEffect(() => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's a space after @
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setMentionStart(lastAtIndex);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  // Fetch users when mention query changes
  useEffect(() => {
    if (showSuggestions && mentionQuery !== undefined) {
      fetchUsers(mentionQuery);
    }
  }, [mentionQuery, showSuggestions]);

  const fetchUsers = async (query: string) => {
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const insertMention = (user: User) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(
      inputRef.current?.selectionStart || value.length
    );
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;

    onChange(newValue);
    setShowSuggestions(false);

    // Notify parent component about the mention
    onMentionAdded?.(user.id, user.name);

    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeMention.length + user.name.length + 2;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || users.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (users[selectedIndex]) {
          insertMention(users[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pr-12 pl-4 text-sm transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
      />

      {/* Mention Suggestions */}
      <AnimatePresence>
        {showSuggestions && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 bottom-full left-0 mb-2 max-h-64 overflow-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {users.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                      {user.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
