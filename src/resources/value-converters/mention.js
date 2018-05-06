export class MentionValueConverter {
  toView(value, color = '#209cee') {
    return ((value || '').replace(/\@(\w+)/g, `<a href="/@/$1" style="color: ${color} !important">@$1</a>`));
  }
}
