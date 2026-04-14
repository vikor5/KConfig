import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useConfig } from '../store/ConfigContext';
import styles from './AliasTab.module.css';

export const AliasTab: React.FC = () => {
  const { config, updateAlias } = useConfig();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

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
    updateAlias(config.alias.filter(a => a.name !== nameToRemove));
  };

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
        {config.alias.map(a => (
          <div key={a.name} className={styles.aliasRow}>
            <div className={styles.nameCol}>{a.name}</div>
            <div className={styles.valCol}>{a.value}</div>
            <button 
              className={styles.deleteBtn}
              onClick={() => handleRemove(a.name)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
