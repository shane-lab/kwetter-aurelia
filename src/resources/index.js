export function configure(config) {
  config.globalResources([
    './value-converters/date',
    './value-converters/format-html',
    './value-converters/keys',
    './value-converters/since',
    './value-converters/hashtag',
    './value-converters/mention',
    './value-converters/url'
  ]);
}
