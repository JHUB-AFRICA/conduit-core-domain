import EndpointSection from "../EndpointSection";

export default function EndpointsList({ endpoints }) {
  return (
    <>
      {endpoints.map((ep, index) => (
        <section
          key={ep.id}
          id={ep.id}
          className={`scroll-mt-10 py-12 border-b border-line ${
            index % 2 === 0 ? "bg-bg" : "bg-bg-soft"
          }`}
        >
          <EndpointSection ep={ep} />
        </section>
      ))}
    </>
  );
}
