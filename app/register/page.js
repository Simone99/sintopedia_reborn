"use client";
import jsSHA from "jssha";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, LoadingScreen, scrollToTop } from "../customComponents";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    institution: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setCorrectiveAction("Check you password and confirm password fields");
      setShowAlert(true);
      setIsLoading(false);
      scrollToTop();
      return;
    }
    const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
    shaObj.update(formData.password);
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: shaObj.getHash("HEX"),
        address: formData.address,
        institution: formData.institution,
      }),
    });
    if (res.ok) {
      router.push("/");
    }else{
      setMessage(await res.text() + " ");
      setCorrectiveAction("Go back to the home page");
      setShowAlert(true);
      setIsLoading(false);
      scrollToTop();
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      {showAlert ? (
        <Alert
          type={"danger"}
          message={message}
          correctiveAction={correctiveAction}
        />
      ) : (
        <></>
      )}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <></>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-sm text-black"
            required
          />
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={formData.surname}
            onChange={handleChange}
            className="w-full p-2 border rounded-sm text-black"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-sm text-black"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-sm pr-12 text-black"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-600 hover:text-gray-900"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded-sm pr-12 text-black"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-600 hover:text-gray-900"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded-sm text-black"
          required
        />

        <input
          type="text"
          name="institution"
          placeholder="Institution"
          value={formData.institution}
          onChange={handleChange}
          className="w-full p-2 border rounded-sm text-black"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-sm hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};