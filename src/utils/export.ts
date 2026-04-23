import type { KanataConfig } from '../types';

const saveFileAs = async (filename: string, content: string | Blob, mimeType: string, extension: string) => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

  try {
    if ('showSaveFilePicker' in window) {
      // type assertion because TS might not have it in standard lib yet depending on tsconfig
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: extension === '.kbd' ? 'Kanata KBD File' : 'KConfig File',
          accept: { [mimeType]: [extension] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('Failed to save file with picker:', err);
    }
    // AbortError means user cancelled the save dialog, do not fallback
    if (err.name === 'AbortError') return;
  }

  // Fallback for browsers without File System Access API
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToKConfig = async (config: KanataConfig) => {
  const json = JSON.stringify(config, null, 2);
  const filename = config.name ? `${config.name.replace(/[^a-z0-9_-]/gi, '_')}.kconfig` : 'config.kconfig';
  await saveFileAs(filename, json, 'application/json', '.kconfig');
};

export const exportToKbd = async (config: KanataConfig) => {
  let kbdContent = '';

  // 1. Defcfg block
  if (config.config.trim()) {
    const formattedConfig = config.config
      .trim()
      .split('\n')
      .map(line => `\t${line}`)
      .join('\n');
    kbdContent += `(defcfg\n${formattedConfig}\n)\n\n`;
  }

  // 2. Defsrc block
  if (config.src.length > 0) {
    kbdContent += `(defsrc\n  ${config.src.join(' ')}\n)\n\n`;
  }

  // 3. Defvar block
  if (config.vars && config.vars.length > 0) {
    kbdContent += `(defvar\n`;
    config.vars.forEach(v => {
      kbdContent += `  ${v.name} ${v.value}\n`;
    });
    kbdContent += `)\n\n`;
  }

  // 4. Defalias block
  if (config.alias.length > 0) {
    kbdContent += `(defalias\n`;
    config.alias.forEach(a => {
      kbdContent += `  ${a.name} ${a.value}\n`;
    });
    kbdContent += `)\n\n`;
  }

  // 4. Deflayer blocks
  config.layers.forEach(layer => {
    kbdContent += `(deflayer ${layer.name}\n  `;
    // We must output mappings in the EXACT order defined by `config.src`
    const mappedKeys = config.src.map(srcKey => {
      const mapping = layer.mappings.find(m => m.src === srcKey);
      return mapping && mapping.dest ? mapping.dest : '_';
    });
    
    kbdContent += `${mappedKeys.join(' ')}\n)\n\n`;
  });

  const filename = config.name ? `${config.name.replace(/[^a-z0-9_-]/gi, '_')}.kbd` : 'config.kbd';
  await saveFileAs(filename, kbdContent, 'text/plain', '.kbd');
};

export const importFromKConfig = (
  file: File, 
  onLoad: (config: KanataConfig) => void,
  onError: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string;
      const parsed = JSON.parse(result) as KanataConfig;
      onLoad(parsed);
    } catch (err) {
      onError('Failed to parse .kconfig file. Ensure it is valid JSON.');
    }
  };
  reader.onerror = () => onError('Failed to read file.');
  reader.readAsText(file);
};
