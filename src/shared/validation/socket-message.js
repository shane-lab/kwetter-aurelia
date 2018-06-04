import enumMapper from 'es6-enum';

export const MessageType = enumMapper('FEED', 'FOLLOWING', 'UNKNOWN');

export const MessageEvent = enumMapper('KWEET_CREATE', 'KWEET_DELETE', 'PROFILE_FOLLOW', 'PROFILE_UNFOLLOW', 'UNKNOWN');

export const mapping = (response) => {
  response = response;
  try {
    response = JSON.parse(response);
  } catch (error) {
    return null;
  }

  let { event = MessageEvent.UNKNOWN, type = MessageType.UNKNOWN } = response;
  delete response.type;
  delete response.event;

  type = type === 'feed' ? MessageType.FEED : event === 'following' ? MessageType.FOLLOWING : MessageType.UNKNOWN;

  if (type === MessageType.FEED) {
    event = event === 'created' ? MessageEvent.KWEET_CREATE : event === 'deleted' ? MessageEvent.KWEET_DELETE : MessageEvent.UNKNOWN;
  }
  if (type === MessageType.FOLLOWING) {
    event = event === 'created' ? MessageEvent.PROFILE_FOLLOW : event === 'deleted' ? MessageEvent.PROFILE_UNFOLLOW : MessageEvent.UNKNOWN;
  }

  return { event, type, data: response.data };
};

export const invalid = (msg) => !msg || !('type' in msg) || msg.type === MessageType.UNKNOWN;
