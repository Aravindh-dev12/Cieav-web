import { createApp } from 'vue'
import App from './App.vue'
import SceneOS from './components/SceneOS.vue'
import './styles.css'
import './animation.css'
import './scene-os.css'

createApp(App).mount('#app')

const sceneRoot = document.createElement('div')
sceneRoot.id = 'scene-os-root'
document.body.appendChild(sceneRoot)
createApp(SceneOS).mount(sceneRoot)
