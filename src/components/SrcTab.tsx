import React, { useState } from 'react';
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
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { useConfig } from '../store/ConfigContext';
import styles from './SrcTab.module.css';

const SortableKeycap = ({ id, onRemove }: { id: string, onRemove: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${styles.keycap} ${isDragging ? styles.dragging : ''}`}
      {...attributes} 
      {...listeners}
    >
      {id}
      <div 
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <X size={12} />
      </div>
    </div>
  );
};

export const SrcTab: React.FC = () => {
  const { config, updateSrc } = useConfig();
  const [newKey, setNewKey] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.src.indexOf(active.id as string);
      const newIndex = config.src.indexOf(over.id as string);
      updateSrc(arrayMove(config.src, oldIndex, newIndex));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const key = newKey.trim();
    if (key && !config.src.includes(key)) {
      updateSrc([...config.src, key]);
      setNewKey('');
    }
  };

  const handleRemove = (idToRemove: string) => {
    if (window.confirm(`Are you sure you want to remove key "${idToRemove}"?`)) {
      updateSrc(config.src.filter(k => k !== idToRemove));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Source Keys (defsrc)</h2>
        <p className={styles.description}>
          Define all physical keys on your keyboard. Order here dictates the physical layout visually for defining layers.
        </p>
      </div>

      <form className={styles.controls} onSubmit={handleAdd}>
        <input 
          className={styles.input}
          placeholder="Add key (e.g. esc, a, lsft)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>Add</button>
      </form>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={config.src}
          strategy={rectSortingStrategy}
        >
          <div className={styles.grid}>
            {config.src.map(key => (
              <SortableKeycap key={key} id={key} onRemove={handleRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
