interface HelloWorldProps {
  msg: string;
}

function HelloWorld({ msg }: HelloWorldProps) {
  return (
    <div className="hello">
      <h1>{msg}</h1>
      <p>
        Edit <code>src/components/HelloWorld.tsx</code> to test hot module replacement.
      </p>
    </div>
  );
}

export default HelloWorld;
