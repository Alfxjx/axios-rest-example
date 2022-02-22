// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
	name: string;
};

type Baseresponse<T> = {
  code: number;
  data: T;
  message: string;
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Baseresponse<Data>>
) {
	res.status(400).json({
		code: 0,
		data: { name: "alfred xujx" },
		message: "request success",
	});
}
