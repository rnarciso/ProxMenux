import { Users, FlaskRound, Youtube } from "lucide-react"

export const metadata = {
  title: "ProxMenux Contributors – Meet the Team Behind ProxMenux",
  description: "Meet the contributors who make ProxMenux possible. Learn more about the developers, testers, and designers who have contributed to the project.",
  openGraph: {
    title: "ProxMenux Contributors – Meet the Team Behind ProxMenux",
    description: "Meet the contributors who make ProxMenux possible. Learn more about the developers, testers, and designers who have contributed to the project.",
    type: "article",
    url: "https://macrimi.github.io/ProxMenux/docs/about/contributors",
    images: [
      {
        url: "https://macrimi.github.io/ProxMenux/contributors-image.png",
        width: 1200,
        height: 630,
        alt: "ProxMenux Contributors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProxMenux Contributors – Meet the Team Behind ProxMenux",
    description: "Meet the contributors who make ProxMenux possible. Learn more about the developers, testers, and designers who have contributed to the project.",
    images: ["https://macrimi.github.io/ProxMenux/contributors-image.png"],
  },
};


const contributors = [
  {
    name: "MALOW",
    role: "Testing",
    avatar: "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/images/avatars/malow.png",
  },
  {
    name: "Segarra",
    role: "Testing",
    avatar: "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/images/avatars/segarra.png",
  },
  {
    name: "Aprilia",
    role: "Testing",
    avatar: "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/images/avatars/aprilia.png",
  },
  {
    name: "Jonatan Castro",
    role: "Testing and reviewer",
    avatar: "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/images/avatars/jonatancastro.png",
    youtubeUrl: "https://www.youtube.com/@JonatanCastro",
  },
  {
    name: "Kamunhas",
    role: "Testing",
    avatar: "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/images/avatars/Kamunhas.png",
  },
]

export default function Contributors() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 🔹 Icon + Title */}
      <div className="flex items-center justify-center mb-6">
        <Users className="h-8 w-8 mr-2 text-blue-500" />
        <h1 className="text-3xl font-bold text-black">Contributors</h1>
      </div>

      {/* 🔹 Description */}
      <p className="text-lg text-black mb-4 text-left">
        The ProxMenux project grows and thrives thanks to the contribution of its collaborators.
      </p>
      <p className="text-base text-black mb-20">This is the well-deserved recognition of their work:</p>

      {/* 🔹 Contributors List */}
      <div className="flex justify-center gap-6 flex-wrap">
        {contributors.map((contributor) => (
          <div key={contributor.name} className="text-center">
            <div className="relative inline-block">
              <img
                src={contributor.avatar || "/placeholder.svg"}
                alt={contributor.name}
                className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
                <FlaskRound className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-black mt-2">{contributor.name}</h3>
            <p className="text-sm text-black">{contributor.role}</p>
            {contributor.youtubeUrl && (
              <a
                href={contributor.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-1 text-red-600 hover:text-red-700"
              >
                <Youtube className="h-4 w-4 mr-1" />
                <span className="text-xs">YouTube</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 🔹 Call to Action */}
      <p className="mt-20 text-base text-black text-left">
        Would you like to contribute? You can collaborate as a <strong>tester</strong>, <strong>developer</strong>,{" "}
        <strong>designer</strong>, or by sharing <strong>ideas and suggestions</strong>. Any contribution is welcome!
      </p>
    </div>
  )
}
