import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          card: "bg-card shadow-lg border border-border rounded-xl",
          headerTitle: "text-2xl font-bold tracking-tight text-foreground",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          formFieldLabel: "text-foreground font-medium",
          formFieldInput: "bg-background border-input text-foreground rounded-md focus:ring-primary focus:border-primary",
          footerActionLink: "text-primary hover:text-primary/90 hover:underline",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          socialButtonsBlockButton: "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
          socialButtonsBlockButtonText: "text-foreground font-medium",
        },
      }}
    />
  );
}
