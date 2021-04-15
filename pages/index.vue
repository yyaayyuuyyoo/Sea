<template>
  <div class="index relative">
    <div
      class="absolute left-0 top-0 w-full h-full flex justify-center items-center pointer-events-none"
    >
      <div class="relative pointer-events-auto border-2 border-white">
        <v-stage
          ref="stage"
          :config="{
            width,
            height,
          }"
          :style="{
            cursor: dragging ? 'grabbing' : 'grab',
          }"
        >
          <!-- @mousemove="onMousemove" -->
          <!--
        <v-layer
          :config="configTestImg"
          @dragmove="onDragmove"
          @dragend="onDragend"
        >
          <VVImage src="https://konvajs.org/assets/yoda.jpg" />
        </v-layer> 
        -->

          <v-layer>
            <v-rect
              :config="{
                x: 0,
                y: 0,
                width,
                height,
                fill: '#d8e2e4',
              }"
            />
            <VVImage
              v-for="sea in seas"
              :key="`sea${sea.sId}`"
              :config="{
                ...sea,
                scaleX: imgScale,
                scaleY: imgScale,
                draggable: true,
              }"
              :src="require(`~/assets/sea-imgs/${sea.sId}.png`)"
              @click="onClick({ sId: sea.sId, evt: $event })"
              @dragstart="onDragstart({ sId: sea.sId, evt: $event })"
              @dragmove="onDragmove({ sId: sea.sId, evt: $event })"
              @dragend="onDragend({ sId: sea.sId, evt: $event })"
            />
          </v-layer>

          <!-- 
        <v-layer>
          <v-circle
            v-for="(visitor, key) in dbVisitors"
            :key="`visitor-${key}`"
            :config="{
              ...visitor,
              radius: 5,
              fill: 'white',
              stroke: 'black',
              'stroke-width': 2,
            }"
          />
        </v-layer>
        -->
        </v-stage>

        <div class="absolute left-0 bottom-0 w-full h-0 flex justify-center">
          <div
            class="mt-6 w-12 h-12 bg-gray-600 cursor-pointer text-white shadow rounded flex justify-center items-center"
            @click="capture"
          >
            <fa-icon icon="camera" size="lg" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <div>
        <h2 class="text-3xl font-bold inline-block">
          What did you sea?
        </h2>
        <div
          class="relative inline-block z-20"
          @mouseenter="showInfo = true"
          @mouseleave="showInfo = false"
        >
          <fa-icon class="ml-2 cursor-pointer" icon="info-circle" />
          <div v-show="showInfo" class="absolute right-0 top-0 w-0 h-0">
            <div
              class="absolute top-0 right-0 -mt-6 w-screen max-w-md bg-white p-4 border"
            >
              How would you compute the time it takes to type the average word
              the one that accounts for the statistical properties of the
              language (e.g. that "the" is the most common word, that "cqq"
              almost never occurs etc.)? Assume that you have access to a huge
              corpus of English texts, and that you are able to compile a lists
              of all the words that you see, including their frequency.
              frequency. Explain your answer in 2 - 3 sentences.
            </div>
          </div>
        </div>
      </div>
      <div
        class="w-full py-2 z-0"
        :style="{ maxWidth: `${width}px` }"
        @mouseenter="timezonePaused = true"
        @mouseleave="timezonePaused = false"
      >
        <marquee-text :duration="30" :paused="timezonePaused">
          <div
            v-for="(offset, city) in timezones"
            :key="city"
            class="inline-block mx-2"
          >
            <span>
              {{ city }}
            </span>

            <span>
              {{ `${(now.getUTCHours() + 24 + offset) % 24}`.padStart(2, '0') }}
            </span>
            <span>:</span>
            <span>
              {{ `${now.getUTCMinutes()}`.padStart(2, '0') }}
            </span>
          </div>
        </marquee-text>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import _range from 'lodash/range'
import _throttle from 'lodash/throttle'
import _sortBy from 'lodash/sortBy'
/* eslint-enable no-unused-vars */

import MarqueeText from 'vue-marquee-text-component'

import VVImage from '@/components/VVImage'

// eslint-disable-next-line no-unused-vars
import { rtdb, ServerTIMESTAMP, auth } from '@/services/firebase'

const width = 1000
const height = 500

const timezones = {
  Nevada: -8,
  Chihuahua: -7,
  Missouri: -6,
  'West Virginia': -5,
  'Mato Grosso': -4,
  'Minas Gerais': -3,
  'République du Mali': -0,
  Serbia: +1,
  Belarus: +2,
  Tajikistan: +5,
  Laos: +7,
  Nantou: +8,
}

const imgScale = 0.5

export default {
  components: {
    //
    MarqueeText,
    VVImage,
  },

  data() {
    return {
      width,
      height,

      now: new Date(),

      configTestImg: {
        x: 40,
        y: 60,
        draggable: true,
      },

      timezones,
      timezonePaused: false,

      imgScale,

      dbReady: false,

      showInfo: false,
      dragging: false,

      uId: '',

      dbSeas: {},
      dbVisitors: {},
    }
  },
  computed: {
    ready() {
      return !!this.uId && this.dbReady
    },
    seas() {
      if (!this.dbSeas) return []

      const seas = {}
      Object.entries(this.dbSeas).map(
        ([sId, sea]) => (seas[sId] = { sId, ...sea })
      )

      return _sortBy(seas, ['uA'])
    },
  },
  watch: {
    ready(ready) {
      if (ready) {
        console.log('ready', { ready })
        this.setPresence()
      } else {
        //
      }
    },
  },
  async created() {
    this.setNow()

    this.uId = await this.getUId()
    console.log('uId:', this.uId)

    const dbVisitorsRef = rtdb.ref(`/visitors`)
    await this.$rtdbBind(
      'dbVisitors',
      dbVisitorsRef.orderByChild('ready').equalTo(true)
    )
      .then(() => {
        console.log('dbVisitors ready', 'dbVisitors')
      })
      .catch(() => console.warn('dbVisitors error'))

    const dbSeasRef = rtdb.ref(`/seas`)
    await this.$rtdbBind('dbSeas', dbSeasRef)
      .then(() => {
        console.log('dbSeasRef ready', 'dbSeasRef')
      })
      .catch(() => console.warn('dbSeasRef error'))

    for (const sId in _range(22)) {
      let sea = this.dbSeas[sId]
      if (!sea || isNaN(sea.x) || isNaN(sea.y)) {
        sea = {}
        sea.x = (width / 2) * Math.random()
        sea.y = (width / 2) * Math.random()
        await this.updateSea({ sId, sea })
      }
    }

    this.dbReady = true
  },
  methods: {
    setNow() {
      const interval = setInterval(() => {
        this.now = new Date()
      }, 10000)

      this.$once('hook:beforeDestroy', () => {
        clearInterval(interval)
      })
    },
    async getUId() {
      await auth.signInAnonymously().catch(err => {
        const { code, message } = err
        console.log('signIn error', { code, message, err })
      })

      const user = await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          // console.log('auth onAuthStateChanged', user)
          unsubscribe()

          resolve(user)
        })
      })

      const uId = user.uid

      return uId
    },
    async setPresence() {
      if (!this.ready) return console.error('setPresence() not ready')

      console.log('setPresence() setup')

      const dbVisitorsRef = rtdb.ref(`/visitors`)
      const visitorRef = dbVisitorsRef.child(this.uId)

      const isOnline = { ready: true, uA: ServerTIMESTAMP }
      await visitorRef.update(isOnline)

      try {
        const connectedRef = rtdb.ref('.info/connected')

        // ref: https://firebase.google.com/docs/reference/js/firebase.database.Reference#off
        connectedRef.off('value', this.onConnected)
        connectedRef.on('value', this.onConnected)

        this.$once('hook:beforeDestroy', () => {
          console.log('setPresence() beforeDestroy')
          connectedRef.off('value', this.onConnected)
        })
      } catch (err) {
        console.error('setPresence()', err)
      }
    },

    async onConnected(snapshot) {
      const dbVisitorsRef = rtdb.ref(`/visitors`)
      const visitorRef = dbVisitorsRef.child(this.uId)

      // NOTE: If we're not currently connected, don't do anything.
      const connected = snapshot.val()
      console.log('presence onConnected()', { connected }, navigator.onLine)

      if (connected === false) return this.backToUnReady()

      const isOffline = {
        ready: false,
        uA: ServerTIMESTAMP,
      }

      const clear = {
        ...isOffline,
      }

      // ref: https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
      await visitorRef.onDisconnect().set(clear)

      return true
    },
    backToUnReady() {
      //
    },
    /* 
    onMousemove: _throttle(async function(evt) {
      console.log('onMousemove', evt)

      // const { clientX, clientY, layerX, layerY } = evt.evt
      // console.log({ clientX, clientY, layerX, layerY })

      const pos = {
        x: evt.evt.layerX,
        y: evt.evt.layerY,
      }

      console.log(pos)

      const dbVisitorsRef = rtdb.ref(`/visitors`)
      const dbVisitorRef = dbVisitorsRef.child(this.uId)

      await dbVisitorRef.update({
        ...pos,
        uA: ServerTIMESTAMP,
      })
    }, 200),
    */
    onClick({ evt, sId }) {
      // onClick({ evt, sId }) {
      console.log('onClick', evt)
      /* 
      const sea = {
        x: evt.evt.layerX,
        y: evt.evt.layerY,
      }

      this.updateSea({ sId, sea })
      */
      // TODO
    },
    onDragstart({ evt, sId }) {
      // console.log('onDragstart', evt)

      this.dragging = true
    },
    onDragmove: _throttle(function({ evt, sId }) {
      // onDragmove({ evt, sId }) {
      // console.log('onDragmove', evt)

      // const { x, y } = evt.target.attrs
      const { x: ix, y: iy } = evt.target.attrs
      const { width: iw, height: ih } = evt.target.attrs.image

      // console.log({ sId, ix, iy })

      let x = ix
      let y = iy
      const scale = imgScale

      if (x < 0) x = 0
      if (x + iw * scale > width) x = width - iw * scale
      if (y < 0) y = 0
      if (y + ih * scale > height) y = height - ih * scale

      const sea = {
        x,
        y,
      }

      this.updateSea({ sId, sea })
    }, 500),
    // },
    onDragend({ evt, sId }) {
      // console.log('onDragend', evt)
      this.dragging = false
    },
    async updateSea({ sId, sea }) {
      // console.log('updateSea', sId)

      const dbSeasRef = rtdb.ref(`/seas`)
      const dbSeaRef = dbSeasRef.child(sId)

      sea.uA = ServerTIMESTAMP

      await dbSeaRef.update(sea)
    },
    capture() {
      // function from https://stackoverflow.com/a/15832662/512042
      function downloadURI(uri, name) {
        const link = document.createElement('a')
        link.download = name
        link.href = uri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      const stage = this.$refs.stage.getNode()
      console.log({ stage })

      const dataURL = stage.toDataURL()
      downloadURI(dataURL, 'sea.png')
    },
  },
}
</script>

<style lang="postcss" scoped>
/* Sample `apply` at-rules with Tailwind CSS */

.index {
  @apply min-h-screen w-screen;
  @apply flex flex-col justify-start items-center;
  @apply text-center;

  background: #d8e2e4;
}

.title {
  @apply rounded-full p-8 m-8;
}

.intro {
  @apply tracking-wide;

  & strong {
    @apply text-xl;
  }
}

.start {
  @apply bg-orange-400 text-white font-bold py-2 px-6 rounded cursor-pointer my-8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
