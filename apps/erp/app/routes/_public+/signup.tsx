import {
  assertIsPost,
  error,
  getCarbonServiceRole,
  signupValidator,
} from "@carbon/auth";
import { verifyAuthSession } from "@carbon/auth/auth.server";
import { flash, getAuthSession } from "@carbon/auth/session.server";
import { getUserByEmail } from "@carbon/auth/users.server";
import { ValidatedForm, validator } from "@carbon/form";
import { redis } from "@carbon/kv";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Heading,
  Separator,
  VStack,
} from "@carbon/react";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { Ratelimit } from "@upstash/ratelimit";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { LuCircleAlert } from "react-icons/lu";

import { Hidden, Input, Submit } from "~/components/Form";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Sign Up" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const authSession = await getAuthSession(request);
  if (authSession && (await verifyAuthSession(authSession))) {
    throw redirect(path.to.authenticatedRoot);
  }

  return null;
}

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1h"),
  prefix: "ratelimit:signup",
  analytics: false,
});

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const validation = await validator(signupValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return json(
      {
        success: false,
        message: "Invalid form data",
      },
      { status: 400 }
    );
  }

  const {
    redirectTo = path.to.onboarding.theme,
    email,
    password,
  } = validation.data;

  const { success: rateSuccess } = await ratelimit.limit(
    request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  );

  if (!rateSuccess) {
    return json(
      {
        success: false,
        message: "Too many requests",
      },
      { status: 429 }
    );
  }

  const client = getCarbonServiceRole();

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser.data) {
    return json(
      {
        success: false,
        message: "User already exists with this email",
      },
      { status: 400 }
    );
  }

  // Create the user account
  const { data, error: signUpError } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.VITE_CARBON_HOST}${redirectTo}`,
    },
  });

  if (signUpError) {
    return json(
      {
        success: false,
        message: signUpError.message,
      },
      { status: 400 }
    );
  }

  if (data?.user) {
    // Create user record in our database
    const { error: userError } = await client.from("user").insert({
      id: data.user.id,
      email: data.user.email!,
      firstName: "",
      lastName: "",
    });

    if (userError) {
      return json(
        {
          success: false,
          message: "Failed to create user profile",
        },
        { status: 400 }
      );
    }

    // Create user permissions record
    const { error: permissionsError } = await client
      .from("userPermission")
      .insert({
        id: data.user.id,
        permissions: {},
      });

    if (permissionsError) {
      return json(
        {
          success: false,
          message: "Failed to create user permissions",
        },
        { status: 400 }
      );
    }
  }

  const successMessage =
    "Check your email for a confirmation link to complete your signup";

  return json(
    {
      success: true,
      message: successMessage,
    },
    await flash(request, error("Success", successMessage))
  );
}

export default function SignupRoute() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? path.to.onboarding.theme;
  const fetcher = useFetcher<typeof action>();

  const isSubmitting = ["submitting", "loading"].includes(fetcher.state);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="text-center mb-8">
        <Heading size="h3">Create your account</Heading>
        <p className="mt-2 text-muted-foreground">
          Get started with your free Carbon account
        </p>
      </div>

      {fetcher.data?.message && fetcher.state === "idle" && (
        <Alert
          className="mb-6 max-w-[380px]"
          variant={fetcher.data.success ? "default" : "destructive"}
        >
          <LuCircleAlert className="h-4 w-4" />
          <AlertTitle>{fetcher.data.success ? "Success!" : "Error"}</AlertTitle>
          <AlertDescription>{fetcher.data.message}</AlertDescription>
        </Alert>
      )}

      <ValidatedForm
        validator={signupValidator}
        fetcher={fetcher}
        defaultValues={{ redirectTo }}
        method="post"
        className="w-[380px]"
      >
        <Hidden name="redirectTo" value={redirectTo} />
        <VStack spacing={4}>
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isSubmitting}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={isSubmitting}
          />
          <Submit isDisabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Submit>
        </VStack>
      </ValidatedForm>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-[380px]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      </div>

      <Button asChild variant="secondary" className="w-[380px] mt-4">
        <a
          href={`/api/oauth/google?redirectTo=${redirectTo}`}
          className="inline-flex items-center justify-center"
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Continue with Google
        </a>
      </Button>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="text-sm text-center text-balance text-muted-foreground w-[380px] mt-4">
        <p>
          By signing up, you agree to the{" "}
          <a
            href="https://carbon.ms/terms"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://carbon.ms/privacy"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
