import React from "react";
import useFluent from "../../../hooks/useFluent";
import Helmet from "react-helmet";
import Item from "./GlossaryItem";

interface IDatum {
  question: string;
  answer: string;
}

const Faq = () => {
  const getString = useFluent();

  const content: IDatum[] = [
    {
      question: getString("faq-list-Q1-q"),
      answer: getString("faq-list-Q1-a"),
    },
    {
      question: getString("faq-list-Q2-q"),
      answer: getString("faq-list-Q2-a"),
    },
    {
      question: getString("faq-list-Q3-q"),
      answer: getString("faq-list-Q3-a"),
    },
    {
      question: getString("faq-list-Q4-q"),
      answer: getString("faq-list-Q4-a"),
    },
    {
      question: getString("faq-list-Q5-q"),
      answer: getString("faq-list-Q5-a"),
    },
    {
      question: getString("faq-list-Q6-q"),
      answer: getString("faq-list-Q6-a"),
    },
    {
      question: getString("faq-list-Q7-q"),
      answer: getString("faq-list-Q7-a"),
    },
    {
      question: getString("faq-list-Q8-q"),
      answer: getString("faq-list-Q8-a"),
    },
    {
      question: getString("faq-list-Q9-q"),
      answer: getString("faq-list-Q9-a"),
    },
    {
      question: getString("faq-list-Q10-q"),
      answer: getString("faq-list-Q10-a"),
    },
  ];

  const pairs = content.map(({ question, answer }, index) => (
    <Item key={index} term={question} definition={answer} />
  ));

  return (
    <div>
      <Helmet>
        <title>
          {getString("navigation-faq") +
            " | " +
            getString("meta-data-title-default-suffix")}
        </title>
        <meta
          property="og:title"
          content={
            getString("navigation-faq") +
            " | " +
            getString("meta-data-title-default-suffix")
          }
        />
      </Helmet>
      <h1>{getString("faq-title")}</h1>
      {pairs}
      <div style={{ marginBottom: "5rem" }} />
    </div>
  );
};

export default Faq;
