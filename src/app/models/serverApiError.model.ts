export class ServerApiError {
  constructor(
    public readonly httpStatusCode: number,
    public readonly endpointUri: string,
    public readonly errorCode: string,
  ) { }
}
