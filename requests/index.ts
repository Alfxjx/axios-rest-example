import { httpMock } from "./config";

export function hello() {
  return httpMock.get("/api/hello")
}