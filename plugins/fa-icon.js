import Vue from 'vue'

import { library, config } from '@fortawesome/fontawesome-svg-core'
import {
  FontAwesomeIcon,
  // FontAwesomeLayers,
} from '@fortawesome/vue-fontawesome'
/*
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
library.add(fas, far)
*/

import {
  //
  faCamera,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  // fas
  faCamera,
  faInfoCircle
)

/*
import {
  //
} from '@fortawesome/free-regular-svg-icons'


library.add(
  // far
)
*/

// This is important, we are going to let Nuxt.js worry about the CSS
config.autoAddCss = false

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.

// Register the component globally
Vue.component('fa-icon', FontAwesomeIcon)
// Vue.component('fa-layer', FontAwesomeLayers)
