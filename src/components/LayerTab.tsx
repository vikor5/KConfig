import React from 'react';
import { useConfig } from '../store/ConfigContext';
import styles from './LayerTab.module.css';

interface LayerTabProps {
  layerIndex: number;
}

export const LayerTab: React.FC<LayerTabProps> = ({ layerIndex }) => {
  const { config, updateLayerName, updateLayerMapping } = useConfig();
  
  const layer = config.layers[layerIndex];
  
  if (!layer) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.title}>
            Layer: 
            <input 
              className={styles.nameInput}
              value={layer.name}
              onChange={(e) => updateLayerName(layerIndex, e.target.value)}
              placeholder="Layer name"
            />
          </div>
          <p className={styles.description}>
            Define mappings for this layer. The layout exactly matches your SRC configuration. 
            Leave blank if you want the original source key (or a fallback like `_`) to be effectively used.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {config.src.map(srcKey => {
          const mapping = layer.mappings.find(m => m.src === srcKey);
          const destValue = mapping ? mapping.dest : '';

          return (
            <div key={srcKey} className={`${styles.keycap} ${destValue.trim() ? styles.mapped : ''}`}>
              <span className={styles.srcLabel}>{srcKey}</span>
              <input 
                className={styles.destInput}
                placeholder="_"
                value={destValue}
                onChange={(e) => updateLayerMapping(layerIndex, srcKey, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
