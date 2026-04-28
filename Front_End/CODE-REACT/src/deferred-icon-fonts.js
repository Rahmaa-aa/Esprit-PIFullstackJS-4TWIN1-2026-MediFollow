/**
 * Entrée Rollup dédiée : le CSS agrégé est référencé depuis index.html (preload → stylesheet).
 * Évite la chaîne critique document → main.js → ce CSS.
 *
 * Contient uniquement Remix Icon (utilisé sur les pages publiques + auth via BlankLayout).
 * Les variantes Phosphor duotone/fill (~333 KB raw / ~37 KB gzip) sont importées par
 * `layouts/defaultLayout.jsx` (lazy) car elles ne servent qu’au dashboard
 * (views/ui-elements/alerts.jsx, components/setting/SettingOffCanvas.jsx).
 */
import "./assets/vendor/remixicon/fonts/remixicon.css";
