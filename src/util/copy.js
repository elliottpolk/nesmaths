export default function install (Vue) {
  Vue.prototype.$copy = (o) => {
    return JSON.parse(JSON.stringify(o))
  }
}
