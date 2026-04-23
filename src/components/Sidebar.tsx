import React from 'react';
import { Layers, List, Settings, Plus, Trash2, Keyboard, GripVertical, Variable } from 'lucide-react';
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
import styles from './Sidebar.module.css';
import { useConfig } from '../store/ConfigContext';

export type TabType = 'src' | 'vars' | 'alias' | 'config' | { type: 'layer'; index: number };

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const SortableLayerItem = ({ 
  layer, 
  isActive, 
  onSelect,
  onRemove,
  canRemove
}: { 
  layer: any; 
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: layer.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${styles.treeItem} ${isActive ? styles.active : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={onSelect}
    >
      <div className={styles.treeItemContent}>
        <div 
          className={styles.dragHandle} 
          {...attributes} 
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <span>{layer.name}</span>
      </div>
      <button 
        className={styles.treeAction}
        onClick={(e) => {
          e.stopPropagation();
          if (canRemove) {
            onRemove();
          }
        }}
        title={!canRemove ? "Cannot delete the last layer" : "Delete layer"}
        style={{ opacity: !canRemove ? 0.3 : undefined }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { config, addLayer, removeLayer, reorderLayers } = useConfig();

  const isLayerActive = (index: number) => {
    return typeof currentTab === 'object' && currentTab.type === 'layer' && currentTab.index === index;
  };

  const handleAddLayer = () => {
    // Generate a somewhat unique name preventing obvious conflicts
    let newName = `layer${config.layers.length}`;
    while (config.layers.some(l => l.name === newName)) {
      newName += '_';
    }
    addLayer(newName);
    onTabChange({ type: 'layer', index: config.layers.length });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.layers.findIndex(l => l.name === active.id);
      const newIndex = config.layers.findIndex(l => l.name === over.id);
      
      const newlyOrdered = arrayMove(config.layers, oldIndex, newIndex);
      reorderLayers(newlyOrdered);
      
      // If the currently selected layer moved, update its index in the tab state
      if (typeof currentTab === 'object' && currentTab.type === 'layer' && currentTab.index === oldIndex) {
         onTabChange({ type: 'layer', index: newIndex });
      } else if (typeof currentTab === 'object' && currentTab.type === 'layer') {
         // other layers shifting around could un-select the active tab if we don't recalculate index properly
         const activeLayerName = config.layers[currentTab.index].name;
         const updatedIndex = newlyOrdered.findIndex(l => l.name === activeLayerName);
         if (updatedIndex !== -1) {
            onTabChange({ type: 'layer', index: updatedIndex });
         }
      }
    }
  };

  const layerNames = config.layers.map(l => l.name);

  return (
    <div className={styles.sidebar}>
      <div 
        className={`${styles.navItem} ${currentTab === 'config' ? styles.active : ''}`}
        onClick={() => onTabChange('config')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={18} />
          Config
        </span>
      </div>

      <div 
        className={`${styles.navItem} ${currentTab === 'src' ? styles.active : ''}`}
        onClick={() => onTabChange('src')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Keyboard size={18} />
          SRC
        </span>
      </div>

      <div 
        className={`${styles.navItem} ${currentTab === 'vars' ? styles.active : ''}`}
        onClick={() => onTabChange('vars')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Variable size={18} />
          Vars
        </span>
      </div>

      <div 
        className={`${styles.navItem} ${currentTab === 'alias' ? styles.active : ''}`}
        onClick={() => onTabChange('alias')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <List size={18} />
          Alias
        </span>
      </div>

      <div className={styles.section}>
        <div className={styles.navItem} style={{ cursor: 'default' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={18} />
            Layers
          </span>
        </div>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={layerNames}
            strategy={verticalListSortingStrategy}
          >
            {config.layers.map((layer, idx) => (
              <SortableLayerItem 
                key={layer.name} 
                layer={layer}
                isActive={isLayerActive(idx)}
                onSelect={() => onTabChange({ type: 'layer', index: idx })}
                canRemove={config.layers.length > 1}
                onRemove={() => {
                  if (window.confirm(`Are you sure you want to delete layer "${layer.name}"?`)) {
                    removeLayer(idx);
                    if (isLayerActive(idx)) onTabChange('src');
                  }
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <button className={styles.addBtn} onClick={handleAddLayer}>
          <Plus size={14} />
          Add Layer
        </button>
      </div>
    </div>
  );
};
