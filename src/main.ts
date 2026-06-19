import { loadConfig } from './config';
import { CaptureWorkflow } from './domain/services/CaptureWorkflow';
import { DigiCamControlAdapter } from './adapters/DigiCamControlAdapter';
import { TauriFileSystemAdapter } from './adapters/TauriFileSystemAdapter';

const config = loadConfig();
const camera = new DigiCamControlAdapter(config.digiCamControlUrl);
const fileSystem = new TauriFileSystemAdapter();
const workflow = new CaptureWorkflow(camera, fileSystem, [], {
  saveFolder: config.saveFolder,
  hotPrintFolder: config.hotPrintFolder,
});

const btn = document.getElementById('capture-btn') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLParagraphElement;

btn.addEventListener('click', async () => {
  btn.disabled = true;
  status.className = '';
  status.textContent = 'Capturing…';
  try {
    await workflow.run();
    status.textContent = 'Ready';
  } catch (err) {
    status.textContent =
      'Error: ' + (err instanceof Error ? err.message : String(err));
    status.className = 'error';
  } finally {
    btn.disabled = false;
  }
});
