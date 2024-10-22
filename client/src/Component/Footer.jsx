function Footer() {
  return (
    <footer className="fixed bottom-0 w-full text-center text-gray-500 bg-white py-1 border-t-4 border-red">
      <p className="m-0 text-black flex justify-center items-center gap-2">
        {/* &copy; <a href="#">Greenbook</a> */}
        Made With
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="red">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"></path>
        </svg>
        By
        <a href="https://ametzo.com" target="_blank">
          Ametzo Technologies
        </a>
      </p>
    </footer>
  );
}

export default Footer;
