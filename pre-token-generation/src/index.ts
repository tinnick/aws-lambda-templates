import type {
  PreTokenGenerationV2TriggerEvent,
  PreTokenGenerationV2TriggerHandler,
} from 'aws-lambda';

export const handler: PreTokenGenerationV2TriggerHandler = async (
  event: PreTokenGenerationV2TriggerEvent
) => {
  const attrs = event.request.userAttributes;

  const claimsToAddOrOverride = {
    phone_number: attrs.phone_number ?? '',
    name: attrs.name ?? '',
    email: attrs.email ?? '',
  };

  event.response = {
    claimsAndScopeOverrideDetails: {
      idTokenGeneration: {
        claimsToAddOrOverride,
      },
      accessTokenGeneration: {
        claimsToAddOrOverride,
      },
    },
  };

  return event;
};
