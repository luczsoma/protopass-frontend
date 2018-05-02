export class ServerApiError {
  constructor(
    public readonly endpointName: string,
    public readonly errorCode: string,
  ) { }
}
