export class ServerApiError {
  constructor(
    public readonly endpointUri: string,
    public readonly errorCode: string,
  ) { }
}
