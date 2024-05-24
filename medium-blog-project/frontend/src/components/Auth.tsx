import { SignupInput } from "@vamshimuluguri/medium-proj-common";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();

  const [postInputs, setPostInputs] = useState<SignupInput>({
    name: "",
    username: "",
    password: "",
  });

async function sendRequest() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs
      );

      const jwt = response.data.jwt;
      
      localStorage.setItem("token", jwt);
      navigate("/blogs");
    } catch (e) {
      alert("Error while signup")
    }
  }

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div>
          <div className="text-3xl font-extrabold">
            {type === "signin" ? "Login" : "Sign up"}
          </div>
          <div className="text-stone-700 mt-4">
            {type === "signin"
              ? "Don't have an account?"
              : "Already Have an account?"}
            <Link
              className="underline pl-2"
              to={type === "signin" ? "/signup" : "/signin"}
            >
              {type === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </div>
          <div className="pt-4">
            {type === "signup" ? (
              <LabelledInput
                label="Name"
                placeholder="Enter your name"
                onChange={(e) => {
                  setPostInputs((postInputs) => ({
                    ...postInputs,
                    name: e.target.value,
                  }));
                }}
              />
            ) : null}
            <LabelledInput
              label="Email"
              placeholder="me@example.com"
              onChange={(e) => {
                setPostInputs((postInputs) => ({
                  ...postInputs,
                  username: e.target.value,
                }));
              }}
            />
            <LabelledInput
              label="Password"
              type={"password"}
              placeholder="password"
              onChange={(e) => {
                setPostInputs((postInputs) => ({
                  ...postInputs,
                  password: e.target.value,
                }));
              }}
            />
            <button
              onClick={sendRequest}
              type="button"
              className="text-white mt-8 w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {type === "signup" ? "Sign Up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabelledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabelledInput({
  label,
  placeholder,
  onChange,
  type,
}: LabelledInputType) {
  return (
    <div>
      <label className="block mb-2 text-sm font-semibold pt-4 text-black-900 ">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        id="first_name"
        className="bg-gray-50 border border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
        required
      />
    </div>
  );
}
