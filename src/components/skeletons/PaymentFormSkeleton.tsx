import { FC } from "react";

const PaymentFormSkeleton: FC = () => {
  return (
    <div className="max-w-xl w-[25rem] mx-auto shadow-lg bg-white rounded-lg overflow-hidden">
      <div className="p-4 flex bg-primary items-center justify-between animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
      </div>

      <div className="flex flex-col animate-pulse">
        <div className="p-4 flex-1">
          <div className="mb-4">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="border p-4 rounded-md flex bg-white">
              <div className="w-36 h-36 bg-gray-300"></div>
              <div className="ml-4 flex-1">
                <div className="h-3 bg-gray-300 rounded w-36 mb-2"></div>
                <div className="flex space-x-2 mt-2">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 bg-gray-300 rounded-full"
                    ></div>
                  ))}
                </div>
                <div className="h-2 bg-gray-300 rounded w-24 mt-4"></div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="border p-4 rounded-md bg-white">
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between items-center">
          <div className="h-5 bg-gray-300 rounded w-16"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFormSkeleton;
