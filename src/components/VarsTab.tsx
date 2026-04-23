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
import styles from './VarsTab.module.css';

const SortableVarRow = ({ 
  v, 
  onRemove,
  onUpdate 
}: { 
  v: { name: string, value: string }, 
  onRemove: (name: string) => void,
  onUpdate: (oldName: string, newName: string, newValue: string) => boolean
}) => {
  const [localName, setLocalName] = useState(v.name);
  const [localValue, setLocalValue] = useState(v.value);

  // Sync if props change externally
  React.useEffect(() => {
    setLocalName(v.name);
    setLocalValue(v.value);
  }, [v.name, v.value]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: v.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commitChanges = () => {
    const trimmedName = localName.trim();
    const trimmedValue = localValue.trim();
    
    if (!trimmedName || !trimmedValue) {
      setLocalName(v.name);
      setLocalValue(v.value);
      return;
    }

    if (trimmedName !== v.name || trimmedValue !== v.value) {
      const success = onUpdate(v.name, trimmedName, trimmedValue);
      if (!success) {
        setLocalName(v.name);
        setLocalValue(v.value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === ' ' || e.code === 'Space') {
      // Prevent dnd-kit from capturing spacebar
      e.stopPropagation();
    }
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
      <input 
        className={`${styles.editInput} ${styles.nameCol}`}
        value={localName}
        onChange={e => setLocalName(e.target.value)}
        onBlur={commitChanges}
        onKeyDown={handleKeyDown}
        placeholder="Var name"
      />
      <input 
        className={`${styles.editInput} ${styles.valCol}`}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={commitChanges}
        onKeyDown={handleKeyDown}
        placeholder="Var value"
      />
      <button 
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(v.name);
        }}
        title="Delete var"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const VarsTab: React.FC = () => {
  const { config, updateVars } = useConfig();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.vars.findIndex(a => a.name === active.id);
      const newIndex = config.vars.findIndex(a => a.name === over.id);
      updateVars(arrayMove(config.vars, oldIndex, newIndex));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && value.trim()) {
      if (!config.vars.some(a => a.name === name.trim())) {
        updateVars([...config.vars, { name: name.trim(), value: value.trim() }]);
        setName('');
        setValue('');
      } else {
        alert('Var name already exists.');
      }
    }
  };

  const handleUpdate = (oldName: string, newName: string, newValue: string): boolean => {
    if (oldName !== newName && config.vars.some(a => a.name === newName)) {
      alert('Var name already exists.');
      return false;
    }
    
    updateVars(config.vars.map(a => 
      a.name === oldName ? { name: newName, value: newValue } : a
    ));
    return true;
  };

  const handleRemove = (nameToRemove: string) => {
    if (window.confirm(`Are you sure you want to delete var "${nameToRemove}"?`)) {
      updateVars(config.vars.filter(a => a.name !== nameToRemove));
    }
  };

  const varNames = config.vars.map(a => a.name);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Variables (defvar)</h2>
        <p className={styles.description}>
          Define custom variables for configurations. 
        </p>
      </div>

      <form className={styles.controls} onSubmit={handleAdd}>
        <input 
          className={styles.input}
          placeholder="Var name (e.g. timeout)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          className={styles.input}
          placeholder="Value (e.g. 200)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>Add Var</button>
      </form>

      <div className={styles.list}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={varNames}
            strategy={verticalListSortingStrategy}
          >
            {config.vars.map(v => (
              <SortableVarRow 
                key={v.name} 
                v={v} 
                onRemove={handleRemove} 
                onUpdate={handleUpdate}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
