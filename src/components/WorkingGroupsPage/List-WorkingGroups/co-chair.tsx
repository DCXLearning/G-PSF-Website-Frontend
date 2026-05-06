/* eslint-disable @next/next/no-img-element */
import React from "react";

type Person = {
    name: string;
    role: string;
    image: string;
};

const TeamSection = () => {
    const governmentReps: Person[] = [
        { name: "Sela", role: "តំណាងរាជរដ្ឋាភិបាល", image: "/image/sela.png" },
        { name: "Sela", role: "តំណាងរាជរដ្ឋាភិបាល", image: "/image/sela.png" },
        { name: "Sela", role: "តំណាងវិស័យឯកជន", image: "/image/sela.png" },
        { name: "Sela", role: "តំណាងវិស័យឯកជន", image: "/image/sela.png" },
    ];

    const governmentNames = governmentReps.filter(
        (person) => person.role === "តំណាងរាជរដ្ឋាភិបាល"
    );

    const privateNames = governmentReps.filter(
        (person) => person.role === "តំណាងវិស័យឯកជន"
    );

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">

                {/* Government Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 border-l-4 border-orange-500 pl-4">
                        តំណាងរាជរដ្ឋាភិបាល
                    </h2>

                    <ul className="mb-8 text-gray-700">
                        {governmentNames.map((person, index) => (
                            <li key={index}>- {person.name}</li>
                        ))}
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mb-5 border-l-4 border-orange-500 pl-4">
                        តំណាងវិស័យឯកជន
                    </h2>

                    <ul className="mb-8 text-gray-700">
                        {privateNames.map((person, index) => (
                            <li key={index}>- {person.name}</li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {governmentReps.map((person, index) => (
                            <TeamCard key={index} person={person} />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

const TeamCard = ({ person }: { person: Person }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="aspect-square bg-gray-200">
            {/* Replace with <Image /> component from next/image for production */}
            <img
                src={person.image}
                alt={person.name}
                className="w-full h-full object-cover"
            />
        </div>
    </div>
);

export default TeamSection;