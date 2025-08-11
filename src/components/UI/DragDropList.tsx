'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DragDropListProps<T> {
  items: T[];
  onReorder?: (items: T[]) => void;
  onItemsChange?: (items: T[]) => void; // Alternative prop name for compatibility
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId?: (item: T, index: number) => string;
  className?: string;
  itemClassName?: string;
  dragHandleClassName?: string;
  disabled?: boolean;
}

// Sortable Item Component
function SortableItem({
  id,
  children,
  className = "",
  disabled = false
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'z-50 shadow-2xl scale-105' : ''} ${
        disabled ? 'opacity-60' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export default function DragDropList<T>({
  items,
  onReorder,
  onItemsChange,
  renderItem,
  getItemId,
  className = "",
  itemClassName = "",
  disabled = false
}: DragDropListProps<T>) {
  // Use provided getItemId or default to index-based ID
  const getItemIdFunction = getItemId || ((item: T, index: number) => `item-${index}`);
  
  // Use onReorder if provided, otherwise use onItemsChange
  const onReorderFunction = onReorder || onItemsChange || (() => {});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeIndex = items.findIndex((_, index) => getItemIdFunction(items[index], index) === active.id);
      const overIndex = items.findIndex((_, index) => getItemIdFunction(items[index], index) === over?.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        onReorderFunction(newItems);
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-400 ${className}`}>
        <i className="fas fa-list text-2xl mb-2"></i>
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item, index) => getItemIdFunction(item, index))}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => {
            const id = getItemIdFunction(item, index);
            return (
              <SortableItem
                key={id}
                id={id}
                className={itemClassName}
                disabled={disabled}
              >
                <div className="group relative">
                  {/* Drag Handle */}
                  {!disabled && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white p-1">
                        <i className="fas fa-grip-vertical text-sm"></i>
                      </div>
                    </div>
                  )}
                  
                  {/* Item Content */}
                  <div className={disabled ? '' : 'ml-8'}>
                    {renderItem(item, index)}
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Specialized component for simple text list items
export function DragDropTextList({
  items,
  onItemsChange,
  placeholder = "Add new item...",
  addButtonText = "Add Item",
  className = "",
  disabled = false
}: {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [newItem, setNewItem] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingValue, setEditingValue] = React.useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onItemsChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newItems = items.map((item, idx) => 
        idx === editingIndex ? editingValue.trim() : item
      );
      onItemsChange(newItems);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, idx) => idx !== index);
    onItemsChange(newItems);
  };

  const renderItem = (item: string, index: number) => (
    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
      {editingIndex === index ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
          />
          <button
            onClick={handleSaveEdit}
            className="text-green-400 hover:text-green-300 px-2"
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            onClick={handleCancelEdit}
            className="text-gray-400 hover:text-red-400 px-2"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-white">{item}</span>
          {!disabled && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(index)}
                className="text-blue-400 hover:text-blue-300 p-1"
                title="Edit"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Delete"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={className}>
      <DragDropList
        items={items}
        onItemsChange={onItemsChange}
        renderItem={renderItem}
        getItemId={(_, index) => `text-item-${index}`}
        className="space-y-2"
        disabled={disabled}
      />

      {!disabled && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            {addButtonText}
          </button>
        </div>
      )}
    </div>
  );
}