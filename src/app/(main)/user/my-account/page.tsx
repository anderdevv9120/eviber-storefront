import AccountForm from "./_component/AccountForm";
import PassWordForm from "./_component/PasswordForm";

export default function MyAccount() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Tài khoản của tôi</h1>
      <div className="flex flex-col gap-8">
        <AccountForm />
        <PassWordForm />
      </div>
    </div>
  );
}
