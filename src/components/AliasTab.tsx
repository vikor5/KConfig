import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useConfig } from '../store/ConfigContext';
import styles from './AliasTab.module.css';

const SortableAliasRow = ({ alias, onRemove }: { alias: { name: string, value: string }, onRemove: (name: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: alias.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${styles.aliasRow} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className={styles.nameCol}>{alias.name}</div>
      <div className={styles.valCol}>{alias.value}</div>
      <button 
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(alias.name);
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const AliasTab: React.FC = () => {
  const { config, updateAlias } = useConfig();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.alias.findIndex(a => a.name === active.id);
      const newIndex = config.alias.findIndex(a => a.name === over.id);
      updateAlias(arrayMove(config.alias, oldIndex, newIndex));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && value.trim()) {
      if (!config.alias.some(a => a.name === name.trim())) {
        updateAlias([...config.alias, { name: name.trim(), value: value.trim() }]);
        setName('');
        setValue('');
      } else {
        alert('Alias name already exists.');
      }
    }
  };

  const handleRemove = (nameToRemove: string) => {
    if (window.confirm(`Are you sure you want to delete alias "${nameToRemove}"?`)) {
      updateAlias(config.alias.filter(a => a.name !== nameToRemove));
    }
  };

  const aliasNames = config.alias.map(a => a.name);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Aliases (defalias)</h2>
        <p className={styles.description}>
          Define custom aliases for complex macros, layer toggles, or sequences. 
        </p>
      </div>

      <form className={styles.controls} onSubmit={handleAdd}>
        <input 
          className={styles.input}
          placeholder="Alias name (e.g. num)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          className={styles.input}
          placeholder="Value (e.g. (layer-toggle numbers))"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>Add Alias</button>
      </form>

      <div className={styles.list}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={aliasNames}
            strategy={verticalListSortingStrategy}
          >
            {config.alias.map(a => (
              <SortableAliasRow key={a.name} alias={a} onRemove={handleRemove} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
