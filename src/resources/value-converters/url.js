export class UrlValueConverter {
  toView(value) {
    value = (value || '').trim();
    return /^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]*$/.test(value) ? `<a href="${value}">${value}</a>` : value;
  }
}
