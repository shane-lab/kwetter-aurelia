export class HashtagValueConverter {
  toView(value, color = '#209cee') {
    return ((value || '').replace(/\#(\w+)/, `<a href="/search/$1" style="color: ${color} !important">#$1</a>`));
  }
}
