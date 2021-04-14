<template>
  <div class="index">
    <div>
      <v-stage
        :config="{
          width,
          height,
        }"
        @mousemove="onMousemove"
      >
        <!--
        <v-layer
          :config="configTestImg"
          @dragmove="onDragmove"
          @dragend="onDragend"
        >
          <VVImage src="https://konvajs.org/assets/yoda.jpg" />
        </v-layer> 
        -->

        <v-layer
          v-for="sea in seas"
          :key="`sea${sea.sId}`"
          :config="{
            ...sea,
            scaleX: 0.3,
            scaleY: 0.3,
            draggable: true,
          }"
          @dragmove="onDragmove({ sId: sea.sId, evt: $event })"
          @dragend="onDragend({ sId: sea.sId, evt: $event })"
        >
          <VVImage :src="require(`~/assets/sea-imgs/${sea.sId}.png`)" />
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
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import _range from 'lodash/range'
import _throttle from 'lodash/throttle'
import _sortBy from 'lodash/sortBy'
/* eslint-enable no-unused-vars */

import VVImage from '@/components/VVImage'

// eslint-disable-next-line no-unused-vars
import { rtdb, ServerTIMESTAMP, auth } from '@/services/firebase'

const width = 1000
const height = 500

export default {
  components: {
    //
    VVImage,
  },

  data() {
    return {
      width,
      height,

      configTestImg: {
        x: 40,
        y: 60,
        draggable: true,
      },

      dbReady: false,

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
      if (!sea) sea = {}

      if (!sea.x) sea.x = (width / 2) * Math.random()
      if (!sea.y) sea.y = (width / 2) * Math.random()

      await this.updateSea({ sId, sea })
    }

    this.dbReady = true
  },
  methods: {
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
    onDragmove: _throttle(function({ evt, sId }) {
      // onDragmove({ evt, sId }) {
      // console.log('onDragmove', evt)

      const { x, y } = evt.target.attrs

      console.log({ sId, x, y })

      const sea = {
        x,
        y,
      }

      this.updateSea({ sId, sea })
    }, 500),
    // },
    onDragend({ evt, sId }) {
      console.log('onDragend', evt)
    },
    async updateSea({ sId, sea }) {
      const dbSeasRef = rtdb.ref(`/seas`)
      const dbSeaRef = dbSeasRef.child(sId)

      sea.uA = ServerTIMESTAMP

      await dbSeaRef.update(sea)
    },
    handleDragstart(e) {
      // save drag element:
      this.dragItemId = e.target.id()
      // move current element to the top:
      const item = this.list.find(i => i.id === this.dragItemId)
      const index = this.list.indexOf(item)
      this.list.splice(index, 1)
      this.list.push(item)

      // TODO
    },
    handleDragend(e) {
      this.dragItemId = null
      // TODO
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
