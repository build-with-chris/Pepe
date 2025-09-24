interface InfoBoxProps {
  title: string;
  text: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, text }) => (
  <div className="w-full max-w-2xl mx-auto bg-gray-200 text-gray-800 rounded-lg p-3 my-6">
    <div className="text-sm md:text-base leading-relaxed text-left md:text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-base md:text-lg text-gray-800 mt-1">{text}</p>
    </div>
  </div>
);

export default InfoBox